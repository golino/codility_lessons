using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenomicRangeQuery
{
    class Program
    {
        public static void Main(string[] args)
        {
            string sequencia = "A";
            //          4  3  2  3  2  2  1  1
            int[] P = { 2, 5, 0 };
            int[] Q = { 4, 5, 6 };

            //Console.WriteLine("Digite a sequencia:");
            //sequencia = Console.ReadLine();
            Console.WriteLine("Sequência = {0}", sequencia);

            Console.WriteLine("Pares = \\n{0}", "");

            int[] result = Sol(sequencia, P, Q);

            Console.WriteLine("Resultado =  {0}", VetToString(result));
            Console.ReadLine();
        }
        public static string VetToString(int[] vet)
        {
            StringBuilder sb = new StringBuilder();

            for (int i = 0; i < vet.Length; i++)
            {
                sb.Append(String.Format("{0}, ", vet[i].ToString()));
            }

            return sb.ToString().Substring(0, sb.Length - 2);
        }
        public static int[] Solution(string S, int[] P, int[] Q)
        {
            int[] menor = new int[P.Length];

            if (S.Length < 1 || S.Length > 100000)
                return menor;

            if (P.Length != Q.Length)
                return menor;
            else if (P.Length < 1 || P.Length > 50000)
                return menor;

            int[] peso = new int[S.Length];

            for (int i = 0; i < S.Length; i++)
            {
                if (peso[i] != 0)
                {
                    switch (S[i])
                    {
                        case 'A': peso[i] = 1; break;
                        case 'C': peso[i] = 2; break;
                        case 'G': peso[i] = 3; break;
                        case 'T': peso[i] = 4; break;
                    }
                }
            }


            for (int i = 0; i < P.Length; i++)
            {
                menor[i] = 4;

                if (P[i] == Q[i])
                {
                    switch (S[P[i]])
                    {
                        case 'A': menor[i] = 1; break;
                        case 'C': if (2 < menor[i]) menor[i] = 2; break;
                        case 'G': if (3 < menor[i]) menor[i] = 3; break;
                    }
                }
                else
                {
                    for (int j = P[i]; j <= Q[i]; j++)
                    {
                        if (S[j].Equals('A'))
                        {
                            menor[i] = 1;
                            break;
                        }
                        else if (S[j].Equals('C'))
                        {
                            menor[i] = 2;
                        }
                        else if (S[j].Equals('G'))
                        {
                            if (3 < menor[i])
                                menor[i] = 3;
                        }
                    }
                }
            }

            return menor;
        }
        public static int[] Sol(string S, int[] P, int[] Q)
        {
            if (S.Length > 100000 || P.Length > 10000 || Q.Length > 10000)
                return null;

            List<int> r = new List<int>();
            List<int> AS = new List<int>();
            List<int> CS = new List<int>();
            List<int> GS = new List<int>();
            List<int> TS = new List<int>();

            for (int i = 0; i < P.Length; i++)
            {
                if (P[i] >= 0 && S.Length >= P[i] && S.Length <= Q[i])
                {
                    for (int j = P[i]; j < Q[i]; j++)
                    {
                        switch (S[j])
                        {
                            case 'A': AS.Add(i); break;
                            case 'C': CS.Add(i); break;
                            case 'G': GS.Add(i); break;
                            case 'T': TS.Add(i); break;
                            default:
                                return null;
                        }
                    }


                    if (AS.Count > 0)
                        r.Add(1);
                    else if (CS.Count > 0)
                        r.Add(2);
                    else if (GS.Count > 0)
                        r.Add(3);
                    else
                        r.Add(4);

                    AS = new List<int>();
                    CS = new List<int>();
                    GS = new List<int>();
                    TS = new List<int>();
                }
            }

            return r.ToArray();
        }
    }
}
