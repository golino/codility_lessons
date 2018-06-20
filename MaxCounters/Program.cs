using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MaxCounters
{
	class Program
	{
		//https://codility.com/demo/results/training4FZNFN-B5R/
		static void Main(string[] args)
		{
			int[] a = { 3, 4, 4, 6, 1, 4, 4 };

			a = RandomArray(5000000);
			int N = a.AsParallel().Max() - 1;

			//Print(a);

			DateTime ini = DateTime.Now, fim;
			int[] s = solution(N, a);
			fim = DateTime.Now;

			//Print(s);

			Console.WriteLine();
			Console.WriteLine("N = {0}, a.Length = {1}", N, a.Length);

			Console.WriteLine("Time: {0} milliseconds.", fim.Subtract(ini).Milliseconds);
			Console.ReadLine();
		}

		private static void Print(int[] s)
		{
			Console.Write("O vetor é: { ");
			Console.Write("{0}", s[0]);

			for (int i = 1; i < s.Length; i++)
			{
				Console.Write(",{0}", s[i]);
			}

			Console.Write(" }");
			Console.WriteLine();
		}
		public static int[] RandomArray(int max)
		{
			Random r = new Random(1);
			int[] a = new int[max];

			for (int i = 0; i < (a.Length / 2); i++)
			{
				a[i] = r.Next(1, max);
				a[a.Length - i - 1] = r.Next(1, max);
			}

			a[(a.Length / 2) + 1] = r.Next(1, max);
			a[r.Next(1, max)] = max;

			return a;
		}
		public static int[] solution(int N, int[] A)
		{
			lock (A)
			{
				int[] V = new int[N];
				int maxCounter = 0;
				bool max = false;

				for (int K = 0; K < A.Length; K++)
				{
					if (A[K] < N + 1)
					{
						V[A[K] - 1]++;

						if (V[A[K] - 1] > maxCounter)
							maxCounter = V[A[K] - 1];

						max = false;
					}
					else
					{
						if (!max)
							for (int i = 0; i < N; V[i++] = maxCounter) ;

						max = true;
					}
				}

				return V;
			}
		}
	}
}