using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CountDiv
{
	class Program
	{
		//https://codility.com/demo/results/training3CZARJ-8Y4/
		static void Main(string[] args)
		{
			int A = 6;
			int B = 11;
			int K = 2;
			DateTime ini = DateTime.Now;
			Console.WriteLine(solution(A, B, K));
			DateTime fim = DateTime.Now;
			TimeSpan result = fim.Subtract(ini);
			Console.WriteLine("Tempo: {0} sec.", result.TotalSeconds);
			Console.ReadLine();
		}
		public static int solution(int A, int B, int K)
		{
			//Teste
			if ((A < 0 || A > 2000000000 || B < 0) | (B > 2000000000 || K < 1 || K > 2000000000))
				return 0;

			int max = B % K != 0 ? ((int)Math.Floor((double)B / (double)K) * K) : B;
			int min = A % K != 0 ? ((int)Math.Floor((double)A / (double)K) * K) + K : A;

			return (max / K) - (min / K) + 1;
		}
	}
}
