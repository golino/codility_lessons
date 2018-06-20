using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PermCheck
{
	class Program
	{
		static void Main(string[] args)
		{
			int[] A = new int[] { 4, 1, 3, 2 };
			Console.WriteLine("O resultado é: {0}", solution(A));
			Console.ReadLine();
		}
		public static int solution(int[] A)
		{
			long max = 0;
			bool[] exists;

			if (A.Length == 0 || A.Length > 100000)
				return 0;

			for (int i = 0; i < A.Length; i++)
			{
				if (A[i] < 1 || A[i] > 1000000000)
					return 0;

				if (A[i] > max)
					max = A[i];
			}

			if (max > A.Length)
				return 0;

			exists = new bool[max + 1];

			for (int i = 0; i < A.Length; i++)
			{
				if (exists[A[i]])
					return 0;
				else
					exists[A[i]] = true;
			}

			return 1;
		}
	}
}
